const { slugify } = require("./slugify");

/**
 * Converts post data from Notion to API format
 */
const mapPostData = async (page, blocks = null) => {
  const properties = page.properties;

  // Basic
  const post = {
    id: page.id,
    title: properties.Name?.title?.[0]?.plain_text || "Untitled",
    cover: page?.cover?.external?.url || properties.Cover?.files?.[0]?.file?.url || null,
    slug: properties.Slug?.rich_text?.[0]?.plain_text || slugify(properties.Name?.title?.[0]?.plain_text || "untitled"),
    status: properties.Status?.select?.name ||  properties.Status?.status?.name || "Draft",
    publishDate: properties.PublishDate?.date?.start || null,
    // featuredImage: properties.FeaturedImage?.files?.[0]?.file?.url || null,  
    excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
    author: properties.Author?.select?.name
  };

  // Tags/Categories
  if (properties.Tags?.multi_select) {
    post.tags = properties.Tags.multi_select.map((tag) => ({
      id: tag.id,
      name: tag.name,
      color: tag.color,
    }));
  } else {
    post.tags = [];
  }

  // Category relation
  if (properties.Category?.relation?.length > 0) {
    const categoryIds = properties.Category.relation.map((rel) => rel.id);
    post.categoryIds = categoryIds;

  // Normally, you would want to fetch additional information about the category here
  // However, this would increase the number of API calls
  // Therefore, we only return the ID, and the frontend will fetch the detailed information later

  } else {
    post.categoryIds = [];
  }

  // Author relation
  if (properties.Author?.relation?.length > 0) {
    const authorId = properties.Author.relation[0].id;
    post.authorId = authorId;
  // Similarly, we only return the author ID

  } else {
    post.authorId = null;
  }

  // Content blocks (if requested)

  if (blocks) {
    post.content = blocks;
  }

  return post;
};

/**
 * Convert author data from Notion to API format
 */
const mapAuthorData = async (page) => {
  console.log("🚀 ~ mapAuthorData ~ page:", page)
  const properties = page.properties;

  return {
    id: page.id,
    name: properties.Name?.title?.[0]?.plain_text || "Unknown Author",
    bio: properties.Bio?.rich_text?.[0]?.plain_text || "",
    avatar: properties.Avatar?.files?.[0]?.file?.url || null,
    email: properties.Email?.email || null,
    twitter: properties.Twitter?.url || null,
    github: properties.GitHub?.url || null,
    website: properties.Website?.url || null,
  };
};

/**
 * Convert category data from Notion to API format
 */
const mapCategoryData = (page) => {
  const properties = page.properties;

  return {
    id: page.id,
    name: properties.Name?.title?.[0]?.plain_text || "Uncategorized",
    description: properties.Description?.rich_text?.[0]?.plain_text || "",
    slug: properties.Slug?.rich_text?.[0]?.plain_text || "uncategorized",
    color: properties.Color?.select?.name || "default",
  };
};

/**
 * Convert settings data from Notion to API format
 */
const mapSettingsData = (page) => {
  if (!page) return {};

  const properties = page.properties;

  return {
    siteName: properties.SiteName?.title?.[0]?.plain_text || "My Blog",
    siteDescription:
      properties.SiteDescription?.rich_text?.[0]?.plain_text || "",
    logo: properties.Logo?.files?.[0]?.file?.url || null,
    favicon: properties.Favicon?.files?.[0]?.file?.url || null,
    footerText: properties.FooterText?.rich_text?.[0]?.plain_text || "",
    socialLinks: {
      twitter: properties.Twitter?.url || null,
      facebook: properties.Facebook?.url || null,
      instagram: properties.Instagram?.url || null,
      github: properties.GitHub?.url || null,
    },
    navItems: properties.NavItems?.rich_text?.[0]?.plain_text
      ? JSON.parse(properties.NavItems.rich_text[0].plain_text)
      : [],
  };
};

module.exports = {
  mapPostData,
  mapAuthorData,
  mapCategoryData,
  mapSettingsData,
};
