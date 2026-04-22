export default function BookPreview({book}){
    return (
      <div className="min-h-screen flex flex-col">
        {/* Book Preview Viewer */}
        <div
          className="relative flex-1 bg-base-300 flex items-center justify-center overflow-hidden"
          style={{ minHeight: "80vh" }}
        ></div>

        {/* Page title */}
        <h1 className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-5xl font-black tracking-widest text-base-content opacity-80 z-10 pointer-events-none">
          BOOK PREVIEW
        </h1>
        {/* only cover picture for now, later a few pages of the book  */}
        {/* Cover image */}
        {book.cover_page_thumbnail && (
          <img
            src={book.cover_page_thumbnail}
            alt={`Cover of ${book.title}`}
            className="relative z-20 max-h-[70vh] shadow-2xl rounded"
          />
        )}
      </div>
    );

}