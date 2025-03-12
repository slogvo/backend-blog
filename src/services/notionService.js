// src/services/notionService.js
const {
  mapPostData,
  mapAuthorData,
  mapCategoryData,
  mapSettingsData,
} = require('../utils/mappers');

class NotionService {
  constructor({ notion, cache, databaseIds }) {
    this.notion = notion;
    this.cache = cache;
    this.databaseIds = databaseIds;
  }

  async getPosts({
    page = 1,
    pageSize = 10,
    category,
    tag,
    status = 'Published',
  }) {
    const cacheKey = `posts_${page}_${pageSize}_${category || ''}_${tag || ''}_${status}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const filter = {
      and: [{ property: 'Status', status: { equals: status } }],
    };
    if (category)
      filter.and.push({
        property: 'Category',
        relation: { contains: category },
      });
    if (tag)
      filter.and.push({ property: 'Tags', multi_select: { contains: tag } });

    const response = await this.notion.databases.query({
      database_id: this.databaseIds.posts,
      filter,
      sorts: [{ property: 'PublishDate', direction: 'descending' }],
      page_size: parseInt(pageSize),
      start_cursor: page > 1 ? (page - 1) * pageSize : undefined,
    });

    const posts = await Promise.all(response.results.map(mapPostData));
    const result = {
      posts,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
    };
    this.cache.set(cacheKey, result);
    return result;
  }

  async getPostBySlug(slug) {
    const cacheKey = `post_${slug}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const response = await this.notion.databases.query({
      database_id: this.databaseIds.posts,
      filter: { property: 'Slug', rich_text: { equals: slug } },
    });

    if (!response.results.length) throw new Error('Post not found');

    const pageData = response.results[0];
    const blocks = await this.getAllBlocksByBlockId(pageData.id);
    const post = await mapPostData(pageData, blocks);

    this.cache.set(cacheKey, post);
    return post;
  }

  async searchPosts({
    query,
    page = 1,
    pageSize = 10,
    category,
    status = 'Published',
  }) {
    if (!query) throw new Error('Search query is required');

    const cacheKey = `search_${query}_${page}_${pageSize}_${category || ''}_${status}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const filter = {
      and: [
        { property: 'Status', status: { equals: status } },
        {
          or: [
            { property: 'Slug', rich_text: { contains: query } },
            { property: 'Excerpt', rich_text: { contains: query } },
            // { property: 'Tags', multi_select: { contains: query } },
          ],
        },
      ],
    };

    if (category) {
      filter.and.push({
        property: 'Category',
        relation: { contains: category },
      });
    }

    const response = await this.notion.databases.query({
      database_id: this.databaseIds.posts,
      filter,
      sorts: [{ property: 'PublishDate', direction: 'descending' }],
      page_size: parseInt(pageSize),
      start_cursor: page > 1 ? (page - 1) * pageSize : undefined,
    });

    const posts = await Promise.all(response.results.map(mapPostData));
    const result = {
      posts,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
      totalResults: posts.length,
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async globalSearch({
    query = '',
    pageSize = 10,
    startCursor,
    filter = { value: 'page', property: 'object' }, // Only get Page by Default
  }) {
    const cacheKey = `global_search_${query}_${pageSize}_${startCursor || ''}_${filter.value}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const response = await this.notion.search({
      query,
      filter,
      sort: { direction: 'descending', timestamp: 'last_edited_time' },
      page_size: parseInt(pageSize),
      start_cursor: startCursor,
    });

    const results = response.results.map((item) => ({
      id: item.id,
      title: item.properties.Name?.title?.[0]?.plain_text || 'Untitled',
      slug:
        item.properties.Slug?.rich_text?.[0]?.plain_text ||
        slugify(properties.Name?.title?.[0]?.plain_text || 'untitled'),
    }));

    const result = {
      results,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
    };

    this.cache.set(cacheKey, result);
    return result;
  }

  async getAllBlocksByBlockId(blockId) {
    let blocks = [];
    let cursor;

    try {
      while (true) {
        const { results, next_cursor } = await this.notion.blocks.children.list(
          {
            block_id: blockId,
            start_cursor: cursor,
          },
        );

        blocks = [
          ...blocks,
          ...results.filter((block) => block.type !== 'unsupported'),
        ];

        if (!next_cursor) break;
        cursor = next_cursor;
      }

      for (let i = 0; i < blocks.length; i++) {
        if (blocks[i].has_children) {
          blocks[i].children = await this.getAllBlocksByBlockId(blocks[i].id);
        }
      }
    } catch (error) {
      console.log(
        `Error in getAllBlocksByBlockId for ${blockId}: ${error.message}`,
      );
    }

    return blocks;
  }

  async getAuthors() {
    const cacheKey = 'authors';
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const response = await this.notion.databases.query({
      database_id: this.databaseIds.authors,
      sorts: [{ property: 'Name', direction: 'ascending' }],
    });

    const authors = await Promise.all(response.results.map(mapAuthorData));
    this.cache.set(cacheKey, authors);
    return authors;
  }

  async getAuthorById(id) {
    const cacheKey = `author_${id}`;
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const pageData = await this.notion.pages.retrieve({ page_id: id });
    const author = await mapAuthorData(pageData);

    this.cache.set(cacheKey, author);
    return author;
  }

  async getCategories() {
    const cacheKey = 'categories';
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const response = await this.notion.databases.query({
      database_id: this.databaseIds.categories,
      sorts: [{ property: 'Name', direction: 'ascending' }],
    });

    const categories = response.results.map(mapCategoryData);
    this.cache.set(cacheKey, categories);
    return categories;
  }

  async getSettings() {
    const cacheKey = 'settings';
    const cachedData = this.cache.get(cacheKey);
    if (cachedData) return cachedData;

    const response = await this.notion.databases.query({
      database_id: this.databaseIds.settings,
      page_size: 1,
    });

    const settings = mapSettingsData(response.results[0]);
    this.cache.set(cacheKey, settings);
    return settings;
  }
}

module.exports = NotionService;
