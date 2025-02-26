/**
 * Chuyển đổi dữ liệu bài viết từ Notion sang định dạng API
 */
const mapPostData = async (page, blocks = null) => {
  const properties = page.properties;

  // Basic
  const post = {
    id: page.id,
    title: properties.Title?.title?.[0]?.plain_text || "Untitled",
    slug: properties.Slug?.rich_text?.[0]?.plain_text || page.id,
    status: properties.Status?.status?.name || "Draft",
    publishDate: properties.PublishDate?.date?.start || null,
    featuredImage: properties.FeaturedImage?.files?.[0]?.file?.url || null,
    excerpt: properties.Excerpt?.rich_text?.[0]?.plain_text || "",
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

    // Thông thường ở đây bạn sẽ muốn lấy thêm thông tin về category
    // Nhưng điều này sẽ làm tăng số lượng API calls
    // Vì vậy chúng ta chỉ trả về ID và frontend sẽ lấy thông tin chi tiết sau
  } else {
    post.categoryIds = [];
  }

  // Author relation
  if (properties.Author?.relation?.length > 0) {
    const authorId = properties.Author.relation[0].id;
    post.authorId = authorId;

    // Tương tự như trên, chúng ta chỉ trả về ID author
  } else {
    post.authorId = null;
  }

  // Content blocks (nếu được yêu cầu)
  if (blocks) {
    post.content = blocks;
  }

  return post;
};

/**
 * Chuyển đổi dữ liệu tác giả từ Notion sang định dạng API
 */
const mapAuthorData = async (page) => {
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
 * Chuyển đổi dữ liệu danh mục từ Notion sang định dạng API
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
 * Chuyển đổi dữ liệu cài đặt từ Notion sang định dạng API
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
