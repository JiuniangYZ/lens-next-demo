import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    console.log("Auth proxy request received==>", request.url);
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get("code"); // 登录凭证
    const state = searchParams.get("state"); // 那个秘密包裹
    const error = searchParams.get("error"); // 或者是错误信息
    console.log("code==>", code);
    console.log("state==>", state);
    console.log("error==>", error);
    if (error) {
      console.error("Error in auth proxy:", error);
      return NextResponse.json(
        { error, details: searchParams.get("error_description") },
        { status: 400 }
      );
    }

    if (!code || !state) {
      console.error("Missing code or state");
      return NextResponse.json(
        { error: "Missing code or state" },
        { status: 400 }
      );
    }

    const decodedState = JSON.parse(decodeURIComponent(state)) as {
      returnTo: string;
    };
    const returnTo = decodedState.returnTo;
    if (!returnTo) {
      console.error("Missing return_to");
      return NextResponse.json({ error: "Missing return_to" }, { status: 400 });
    }
    console.log("returnTo==>", returnTo);
    if (!returnTo.startsWith("http")) {
      console.error("Invalid return_to");
      return NextResponse.json({ error: "Invalid return_to" }, { status: 400 });
    }
    const tgt = new URL(returnTo);
    tgt.searchParams.set("code", code);
    tgt.searchParams.set("state", state);
    console.log("tgt==>", tgt.toString());
    return NextResponse.redirect(tgt.toString());
  } catch (error) {
    console.error("Error in auth proxy:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
