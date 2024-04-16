import liff from "@line/liff";

interface Profile {
  pictureUrl?: string;
  displayName?: string;
  statusMessage?: string;
}

export async function login(): Promise<Profile | null> {
  try {
    const liffId = process.env.NEXT_PUBLIC_LINE_LIFF_ID;
    if (!liffId) {
      console.error("LINE_LIFF_ID is not defined.");
      return null;
    }

    await liff.init({ liffId });
    if (!liff.isLoggedIn()) {
      liff.login();
      return null; // Return null when not logged in yet
    } else {
      const profile = await liff.getProfile();
      // console.log("Login success: ", profile);
      return profile; // Return profile when logged in
    }
  } catch (error) {
    console.error("LIFF initialization or profile retrieval failed:", error);
    return null; // Return null on error
  }
}
