import React from "react";
import { assets } from "../assets/frontend/assets";

const Contact = () => {
  return (
    <div>
      <div className="text-center text-2xl pt-10 text-gray-500">
        <p>
          CONTACT <span className="text-gray-700 font-semibold">US</span>
        </p>
      </div>

      <div className="my-10 flex flex-col justify-center md:flex-row gap-10 mb-10 text-sm">
        <img
          className="w-full md:max-w-[360px]"
          src={assets.contact_image}
          alt=""
        />
        <div className="flex flex-col justify-center items-start gap-6">
          <p className="font-semibold text-lg text-gray-600">Our Office</p>
          <p className="text-gray-500">
            181 M.6 Charoen Pradit Rd,
            <br /> Rusamilae, Mueang Pattani District, Pattani 94000
          </p>
          <p className="text-gray-500">
            Tel: 073 313 928 <br />
          </p>
          <p className="text-gray-500">Email: 6620610023@email.psu.ac.th</p>
          <p className="font-semibold text-lg text-gray-600">
            Opportunities at PSU.
          </p>

          <button className="border border-black px-8 py-4 text-sm hover:bg-black hover:text-white transition-all duration-500">
            Explore
          </button>
        </div>
      </div>
    </div>
  );
};

export default Contact;
