/** WordPress REST API v2 응답 타입 */

export interface WPPost {
  id: number;
  title: { rendered: string };
  slug: string;
  status: "publish" | "draft" | "private" | "pending" | "future";
  date: string; // ISO 8601
  date_gmt: string;
  modified: string;
  modified_gmt: string;
  link: string;
  type: string;
}

export interface WPSiteInfo {
  name: string;
  description: string;
  url: string;
  home: string;
  gmt_offset: number;
  timezone_string: string;
}

export interface WPUser {
  id: number;
  name: string;
  slug: string;
  roles: string[];
}

export interface WPPostsResponse {
  posts: WPPost[];
  total: number;
  totalPages: number;
}
