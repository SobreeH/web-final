import React from "react";
import { assets } from "../assets/frontend/assets";

const Footer = () => {
  return (
    <div className="md:mx-10">
      <div className="flex flex-col sm:grid grid-cols-[3fr_1fr_1fr] gap-14 my-10 mt-40 text-sm">
        {/* ----- Left section ----- */}
        <div>
          <img className="mb-5 w-40" src={assets.logo} alt="" />
          <p className="w-full md:w-2/3 text-gray-600 leading-6">
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Quaerat est
            expedita tempore corporis impedit asperiores explicabo voluptate.
            Illo dolor repellat officia fuga, sunt nulla vel doloribus, aut nemo
            totam magni!
          </p>
        </div>
        {/* ----- Center section ----- */}
        <div>
          <p className="text-xl font-medium mb-5">Company</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>Home</li>
            <li>About us</li>
            <li>Contact us</li>
            <li>Privacy policy</li>
          </ul>
        </div>
        {/* ----- Right section ----- */}
        <div>
          <p className="text-xl font-medium mb-5">GET IN TOUCH</p>
          <ul className="flex flex-col gap-2 text-gray-600">
            <li>+66 073 313 928</li>
            <li>6620610023@email.psu.ac.th</li>
          </ul>
        </div>
        <div></div>
      </div>
      {/* ----- Copyright Text ----- */}
      <div>
        <hr />
        <p className="py-5 text-sm text-center">
          © Copyright Faculty of Communication Sciences
        </p>
      </div>
    </div>
  );
};

export default Footer;
