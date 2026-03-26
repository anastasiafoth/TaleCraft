import { Link } from "react-router-dom";

export default function ChildrenCards({ children }) {
  const ChildrenElements = children.map((child) => (
    <div key={child.child_id} className="card">
      <Link
        to={`children/${child.child_id}`}
        aria-label={`View details for ${child.first_name}`}
        className="child-card"
      >
        <div>
          <img src={child.profile_img} width="300px" />
          <h2>{child.first_name}</h2>
          <p>{child.birthdate}</p>
          <div className="actions">
            <>
              <button>Edit</button>
              <button>Delete</button>
            </>
          </div>
        </div>
      </Link>
    </div>
  ));

  return (
    <div className="book-list">
      <section>{ChildrenElements}</section>
    </div>
  );
}
