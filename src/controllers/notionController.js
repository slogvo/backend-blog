const { notion, cache, databaseIds } = require("../config/notion");
const {
  mapPostData,
  mapAuthorData,
  mapCategoryData,
  mapSettingsData,
} = require("../utils/mappers");

/**
 * Lấy danh sách bài viết với phân trang và lọc
 */
const getPosts = async (req, res, next) => {
  try {
    const {
      page = 1,
      pageSize = 10,
      category,
      tag,
      status = "Published",
    } = req.query;
    const cacheKey = `posts_${page}_${pageSize}_${category || ""}_${
      tag || ""
    }_${status}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Prepare filter conditions
    const filter = {
      and: [
        {
          property: "Status",
          status: {
            equals: status,
          },
        },
      ],
    };

    // Add category filter if provided
    if (category) {
      filter.and.push({
        property: "Category",
        relation: {
          contains: category,
        },
      });
    }

    // Add tag filter if provided
    if (tag) {
      filter.and.push({
        property: "Tags",
        multi_select: {
          contains: tag,
        },
      });
    }

    // Query Notion database
    const response = await notion.databases.query({
      database_id: databaseIds.posts,
      // filter: filter,
      // sorts: [
      //   {
      //     property: "PublishDate",
      //     direction: "descending",
      //   },
      // ],
      page_size: parseInt(pageSize),
      start_cursor: page > 1 ? (page - 1) * pageSize : undefined,
    });

    // Map Notion data to our format
    const posts = await Promise.all(response.results.map(mapPostData));

    // Store in cache
    const result = {
      posts,
      nextCursor: response.next_cursor,
      hasMore: response.has_more,
    };

    cache.set(cacheKey, result);
    res.json(result);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết bài viết theo ID
 */
const getPostById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `post_${id}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get page data
    const pageData = await notion.pages.retrieve({
      page_id: id,
    });

    // Get page content (blocks)
    const blocks = await getAllBlocksByBlockId(id);

    // Map data
    const post = await mapPostData(pageData, blocks);

    // Store in cache
    cache.set(cacheKey, post);
    res.json(post);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy tất cả blocks của một trang Notion
 */
const getAllBlocksByBlockId = async (blockId) => {
  let blocks = [];
  let cursor;

  while (true) {
    const { results, next_cursor } = await notion.blocks.children.list({
      block_id: blockId,
      start_cursor: cursor,
    });

    blocks = [...blocks, ...results];

    if (!next_cursor) break;
    cursor = next_cursor;
  }

  // Get nested blocks if any
  for (let i = 0; i < blocks.length; i++) {
    const block = blocks[i];

    if (block.has_children) {
      const childBlocks = await getAllBlocksByBlockId(block.id);
      blocks[i].children = childBlocks;
    }
  }

  return blocks;
};

/**
 * Lấy danh sách tác giả
 */
const getAuthors = async (req, res, next) => {
  try {
    const cacheKey = "authors";

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query Notion database
    const response = await notion.databases.query({
      database_id: databaseIds.authors,
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });

    // Map Notion data to our format
    const authors = await Promise.all(response.results.map(mapAuthorData));

    // Store in cache
    cache.set(cacheKey, authors);
    res.json(authors);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy chi tiết tác giả theo ID
 */
const getAuthorById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const cacheKey = `author_${id}`;

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Get page data
    const pageData = await notion.pages.retrieve({
      page_id: id,
    });

    // Map data
    const author = await mapAuthorData(pageData);

    // Store in cache
    cache.set(cacheKey, author);
    res.json(author);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy danh sách danh mục
 */
const getCategories = async (req, res, next) => {
  try {
    const cacheKey = "categories";

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query Notion database
    const response = await notion.databases.query({
      database_id: databaseIds.categories,
      sorts: [
        {
          property: "Name",
          direction: "ascending",
        },
      ],
    });

    // Map Notion data to our format
    const categories = response.results.map(mapCategoryData);

    // Store in cache
    cache.set(cacheKey, categories);
    res.json(categories);
  } catch (error) {
    next(error);
  }
};

/**
 * Lấy cài đặt website
 */
const getSettings = async (req, res, next) => {
  try {
    const cacheKey = "settings";

    // Check cache first
    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    // Query Notion database
    const response = await notion.databases.query({
      database_id: databaseIds.settings,
      page_size: 1, // Chỉ cần 1 bản ghi settings
    });

    // Map Notion data to our format
    const settings = mapSettingsData(response.results[0]);

    // Store in cache
    cache.set(cacheKey, settings);
    res.json(settings);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPosts,
  getPostById,
  getAuthors,
  getAuthorById,
  getCategories,
  getSettings,
};
