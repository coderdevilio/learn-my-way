import Link from "next/link";
import { useEffect, useState } from "react";
//
//
const InstructorNav = () => {
  const [current, setCurrent] = useState("");

  useEffect(() => {
    process.browser && setCurrent(window.location.pathname);
    // console.log(window.location.pathname);
  }, [process.browser && window.location.pathname]);

  return (
    <div className="nav flex-column nav-pills ">
      <Link
        href="/instructor"
        className={`nav-link ${current === "/instructor" && "active"}`}
      >
        Dashboard
      </Link>
      <Link
        href="/instructor/course/create"
        className={`nav-link ${
          current === "/instructor/course/create" && "active"
        }`}
      >
        Course create
      </Link>
      {/* <Link
        href="/instructor/revenue"
        className={`nav-link ${current === "/instructor/revenue" && "active"}`}
      >
        Revenue
      </Link> */}
    </div>
  );
};

export default InstructorNav;
