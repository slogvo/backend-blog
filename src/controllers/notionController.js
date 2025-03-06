const { notion, cache, databaseIds } = require("../config/notion");
const {
  mapPostData,
  mapAuthorData,
  mapCategoryData,
  mapSettingsData,
} = require("../utils/mappers");

/**
 * Retrieves a list of posts with pagination and filtering
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
      filter: filter,
      // sorts: [
      //   {
      //     property: "PublishDate",
      //     direction: "descending",
      //   },
      // ],
      page_size: parseInt(pageSize),
      start_cursor: page > 1 ? (page - 1) * pageSize : undefined,
    });
    console.log("🚀 ~ getPosts ~ response:", response?.results[0]?.properties?.Excerpt?.rich_text)

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
 * Retrieves detailed information about a post by its ID
 */
// const getPostById = async (req, res, next) => {
//   try {
//     const { id } = req.params;
//     const cacheKey = `post_${id}`;

//     // Check cache first
//     const cachedData = cache.get(cacheKey);
//     if (cachedData) {
//       return res.json(cachedData);
//     }

//     // Get page data
//     const pageData = await notion.pages.retrieve({
//       page_id: id,
//     });
//     console.log("🚀 ~ getPostById ~ pageData:", pageData)

//     // Get page content (blocks)
//     const blocks = await getAllBlocksByBlockId(id);

//     // Map data
//     const post = await mapPostData(pageData, blocks);

//     // Store in cache
//     cache.set(cacheKey, post);
//     res.json(post);
//   } catch (error) {
//     next(error);
//   }
// };

/**
 * Retrieves detailed information about a post by its slug (or ID as fallback)
 */
const getPostBySlug = async (req, res, next) => {
  try {
    const { slug } = req.params; 
    const cacheKey = `post_${slug}`;

    const cachedData = cache.get(cacheKey);
    if (cachedData) {
      return res.json(cachedData);
    }

    const response = await notion.databases.query({
      database_id: databaseIds.posts,
      filter: {
        property: "Slug",
        rich_text: {
          equals: slug,
        },
      },
    });

    if (!response.results.length) {
      return res.status(404).json({ error: "Post not found" });
    }

    const pageData = response.results[0]; 
    const blocks = await getAllBlocksByBlockId(pageData.id);

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
 * Retrieves all blocks of a Notion page
 */
// const getAllBlocksByBlockId = async (blockId) => {
//   let blocks = [];
//   let cursor;

//   while (true) {
//     const { results, next_cursor } = await notion.blocks.children.list({
//       block_id: blockId,
//       start_cursor: cursor,
//     });

//     blocks = [...blocks, ...results];

//     if (!next_cursor) break;
//     cursor = next_cursor;
//   }

//   // Get nested blocks if any
//   for (let i = 0; i < blocks.length; i++) {
//     const block = blocks[i];

//     if (block.has_children) {
//       const childBlocks = await getAllBlocksByBlockId(block.id);
//       blocks[i].children = childBlocks;
//     }
//   }

//   return blocks;
// };

const getAllBlocksByBlockId = async (blockId) => {
  let blocks = [];
  let cursor;

  try {
    while (true) {
      try {
        const { results, next_cursor } = await notion.blocks.children.list({
          block_id: blockId,
          start_cursor: cursor,
        });

        blocks = [...blocks, ...results.filter(block => {
          if (block.type === "unsupported") {
            console.log(`Skipping unsupported block: ${block.id}`);
            return false;
          }
          return true;
        })];

        if (!next_cursor) break;
        cursor = next_cursor;
      } catch (error) {
        console.log(`Error fetching blocks for ${blockId}: ${error.message}`);
        break; 
      }
    }

    for (let i = 0; i < blocks.length; i++) {
      const block = blocks[i];
      if (block.has_children) {
        try {
          const childBlocks = await getAllBlocksByBlockId(block.id);
          blocks[i].children = childBlocks;
        } catch (childError) {
          console.log(`Skipping nested blocks for ${block.id}: ${childError.message}`);
          blocks[i].children = []; 
        }
      }
    }

    return blocks;
  } catch (error) {
    console.log(`Critical error in getAllBlocksByBlockId for ${blockId}: ${error.message}`);
    return blocks; 
  }
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
  // getPostById,
  getPostBySlug,
  getAuthors,
  getAuthorById,
  getCategories,
  getSettings,
};
