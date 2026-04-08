import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface TopPost {
  id: string;
  title: string;
  pageviews30d: number;
  clicks30d: number;
  site: { name: string };
}

export function TopPosts({ posts }: { posts: TopPost[] }) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-sm">인기 글 TOP 5</CardTitle>
      </CardHeader>
      <CardContent>
        {posts.length === 0 ? (
          <p className="py-6 text-center text-sm text-muted-foreground">
            동기화된 글이 없습니다
          </p>
        ) : (
          <div className="space-y-3">
            {posts.map((post, i) => (
              <div key={post.id} className="flex items-center gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-emerald-50 text-xs font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                  {i + 1}
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{post.title}</p>
                  <p className="text-xs text-muted-foreground">{post.site.name}</p>
                </div>
                <div className="flex gap-2 text-xs tabular-nums">
                  <Badge variant="secondary">{post.pageviews30d.toLocaleString()} PV</Badge>
                  <Badge variant="outline">{post.clicks30d.toLocaleString()} 클릭</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
