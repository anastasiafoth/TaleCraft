export default function BookPreview({book}){
    return (
      <div className="flex flex-col items-center">
        {/* Book Preview Viewer */}
        {/* only cover picture for now, later a few pages of the book  */}
        {/* Cover image */}
        {book.cover_thumbnail_url && (
          <img
            src={book.cover_thumbnail_url}
            alt={`Cover of ${book.title}`}
            className="block w-auto max-w-full max-h-screen shadow-2xl rounded"
          />
        )}
      </div>
    );

}