
export default function Register() {
  return <h1>Register Form</h1>;
}


// BookCard bekommt einen "actions"-Slot
// function BookCard({ book, actions }) {
//   return (
//     <div>
//       <img src={book.cover} />
//       <h2>{book.title}</h2>
//       <p>{book.description}</p>
//       <div className="actions">{actions}</div>
//     </div>
//   );
// }

// // Admin-Route → Edit + Delete
// <BookCard book={book} actions={
//   <>
//     <button>Edit</button>
//     <button>Delete</button>
//   </>
// } />

// // Public-Route → nur "Buy"
// <BookCard book={book} actions={
//   <button>Buy now</button>
// } />

// // Readonly → gar keine Buttons
// <BookCard book={book} actions={null} />