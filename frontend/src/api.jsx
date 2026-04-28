const DEV_URL = "https://talecraft-owts.onrender.com";

// __________________ User __________________________

export async function refreshToken(token) {
  const res = await fetch(`${DEV_URL}/api/refresh`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
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

export async function logoutUser(token) {
  const res = await fetch(`${DEV_URL}/api/logout`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function updateUser(creds, token) {
  const res = await fetch(`${DEV_URL}/api/user`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
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
// __________________ Children __________________________

export async function getAllChildren(token) {
  const res = await fetch(`${DEV_URL}/api/children`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok) throw data;

  return data;
}

export async function getChildById(id, token) {
  const res = await fetch(`${DEV_URL}/api/children/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function editChild(id, creds, token) {
  const res = await fetch(`${DEV_URL}/api/children/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

export async function deleteChild(id, token) {
  const res = await fetch(`${DEV_URL}/api/children/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
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

export async function addNewChild(token, creds) {
  const res = await fetch(`${DEV_URL}/api/children`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
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

// __________________ Books __________________________

export async function getPublishedBooks() {
  const res = await fetch(`${DEV_URL}/api/books`);
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getMyBooks(token) {
  const res = await fetch(`${DEV_URL}/api/my-books`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getBookById(id, token) {
  const res = await fetch(`${DEV_URL}/api/books/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function addBook(creds, token) {
  const res = await fetch(`${DEV_URL}/api/books`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function updateBook(id, creds, token) {
  const res = await fetch(`${DEV_URL}/api/books/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function deleteBook(id, token) {
  const res = await fetch(`${DEV_URL}/api/books/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

// __________________ Chapters __________________________

export async function getChaptersByBook(bookId) {
  const res = await fetch(`${DEV_URL}/api/books/${bookId}/chapters`);
  console.log(bookId);
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getChapterById(chapterId) {
  const res = await fetch(`${DEV_URL}/api/chapters/${chapterId}`);
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function addChapter(bookId, creds, token) {
  const res = await fetch(`${DEV_URL}/api/books/${bookId}/chapters`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function updateChapter(chapterId, creds, token) {
  const res = await fetch(`${DEV_URL}/api/chapters/${chapterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function deleteChapter(chapterId, token) {
  const res = await fetch(`${DEV_URL}/api/chapters/${chapterId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

// __________________ Pages __________________________

export async function getPagesByBook(bookId) {
  const res = await fetch(`${DEV_URL}/api/books/${bookId}/pages`);
  const data = await res.json();

  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getPagesByChapter(chapterId) {
  const res = await fetch(`${DEV_URL}/api/chapters/${chapterId}/pages`);
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getPageById(pageId) {
  const res = await fetch(`${DEV_URL}/api/pages/${pageId}`);
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function addPage(chapterId, creds, token) {
  const res = await fetch(`${DEV_URL}/api/chapters/${chapterId}/pages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function updatePage(pageId, creds, token) {
  const res = await fetch(`${DEV_URL}/api/pages/${pageId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function deletePage(pageId, token) {
  const res = await fetch(`${DEV_URL}/api/pages/${pageId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

// __________________ Personalization __________________________

export async function getAllPersonalizations(token) {
  const res = await fetch(`${DEV_URL}/api/personalizations`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function createPersonalization(bookId, token) {
  const res = await fetch(`${DEV_URL}/api/books/${bookId}/personalization`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getPersonalizationById(personalizationId, token) {
  const res = await fetch(
    `${DEV_URL}/api/personalization/${personalizationId}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function deletePersonalization(personalizationId, token) {
  const res = await fetch(
    `${DEV_URL}/api/personalization/${personalizationId}`,
    {
      method: "DELETE",
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

// __________________ Book Character Templates __________________________

export async function getCharacterTemplates(bookId, token) {
  const res = await fetch(
    `${DEV_URL}/api/books/${bookId}/character-templates`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function addCharacterTemplate(bookId, creds, token) {
  const res = await fetch(
    `${DEV_URL}/api/books/${bookId}/character-templates`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(creds),
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getCharacterTemplateById(templateId, token) {
  const res = await fetch(`${DEV_URL}/api/character-templates/${templateId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function updateCharacterTemplate(templateId, creds, token) {
  const res = await fetch(`${DEV_URL}/api/character-templates/${templateId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function deleteCharacterTemplate(templateId, token) {
  const res = await fetch(`${DEV_URL}/api/character-templates/${templateId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

// __________________ Personalization Characters __________________________

export async function getPersonalizationCharacters(personalizationId, token) {
  const res = await fetch(
    `${DEV_URL}/api/personalizations/${personalizationId}/characters`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getPersonalizationCharacterById(characterId, token) {
  const res = await fetch(`${DEV_URL}/api/characters/${characterId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function updatePersonalizationCharacter(
  characterId,
  creds,
  token,
) {
  const res = await fetch(`${DEV_URL}/api/characters/${characterId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function resetPersonalizationCharacter(characterId, token) {
  const res = await fetch(`${DEV_URL}/api/characters/${characterId}/reset`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

// __________________ Reading Progress __________________________

export async function getAllReadingProgress(childId, token) {
  const res = await fetch(
    `${DEV_URL}/api/reading-progress?child_id=${childId.child_id}`,
    {
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    },
  );
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function createReadingProgress(creds, token) {
  const res = await fetch(`${DEV_URL}/api/reading-progress`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  console.log(data);
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getReadingProgressById(progressId, token) {
  const res = await fetch(`${DEV_URL}/api/reading-progress/${progressId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function updateReadingProgress(progressId, creds, token) {
  const res = await fetch(`${DEV_URL}/api/reading-progress/${progressId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(creds),
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function deleteReadingProgress(progressId, token) {
  const res = await fetch(`${DEV_URL}/api/reading-progress/${progressId}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}

export async function getAssets(token) {
  const res = await fetch(`${DEV_URL}/api/assets`, {
    method: "GET",
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
  const data = await res.json();
  if (!res.ok)
    throw {
      message: data.message || "Unknown error",
      status: res.status,
      error: data.error,
    };
  return data;
}
