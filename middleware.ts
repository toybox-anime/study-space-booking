import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  // アクセスしてきた人のブラウザから「認証情報」を取り出す
  const basicAuth = req.headers.get('authorization');

  if (basicAuth) {
    // 送られてきた暗号を解読して、IDとパスワードを取り出す
    const authValue = basicAuth.split(' ')[1];
    const [user, pwd] = atob(authValue).split(':');

    // .env.local に設定した正解のIDとパスワード
    const validUser = process.env.ADMIN_USER;
    const validPass = process.env.ADMIN_PASS;

    // IDとパスワードが両方一致したら、そのままページを表示する（ヨシ！）
    if (user === validUser && pwd === validPass) {
      return NextResponse.next();
    }
  }

  // 認証に失敗した、またはまだ入力していない場合は、パスワード入力画面を出す
  return new NextResponse('認証が必要です', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="Secure Area"',
    },
  });
}

// 💡 ここがポイント！この門番を配置するURL（/admin とその配下すべて）を指定する
export const config = {
  matcher: ['/admin/:path*'],
};