import BooksCards from "./BooksCards";

export default function AuthorBooks() {
  const books = [
    {
      id: 1,
      title: "Title",
      discription: "Text test",
      cover_url:
        "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRHpPhN599nGIV0VLhsAtqHIxY7Z12eSLCwPQ&s",
    },
    {
      id: 2,
      title: "Title2",
      discription: "2Text test",
      cover_url:
        "https://marcuwekling.reimkultur-shop.de/cdn/shop/files/NEINhorn_Geburtstag_Cover.jpg?v=1728393210",
    },
    {
      id: 3,
      title: "Title3",
      discription: "3Text test",
      cover_url:
        "https://knopf-im-bauch.com/wp-content/uploads/2019/10/Alle_m%C3%BCssen_mal_aufs_klo_Bild-250x300.jpg",
    },
  ];

  return (
    <section>
      <h1>All published and unpublished books here</h1>
      <BooksCards
        books={books}
        actions={
          <>
            <button>Edit</button>
            <button>Delete</button>
          </>
        }
      />
    </section>
  );
}
