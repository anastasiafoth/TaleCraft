const DEV_URL = "https://talecraft-owts.onrender.com";

export async function loginUser(creds) {
  const res = await fetch(`${DEV_URL}/api/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();

  if (!res.ok) {
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  }

  return data;
}

export async function getUserData(token) {
    const res = await fetch(`${DEV_URL}/api/user`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  }); 

  const data = await res.json();
  if (!res.ok) throw data;

  return data;
}

export async function registerUser(creds) {
  const res = await fetch(`${DEV_URL}/api/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();

  if (!res.ok) {
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  }

  return data;
}
