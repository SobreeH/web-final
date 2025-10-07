import React, { useContext, useEffect, useMemo, useState } from "react";
import { useParams, useNavigate } from "react-router-dom"; // <-- added useNavigate
import { assets } from "../../assets/assets";
import { AdminContext } from "../../context/AdminContext";

const EditDoctor = () => {
  const navigate = useNavigate(); // <-- for redirect after update
  const { doctorId } = useParams();
  const { doctors, getAllDoctors, editDoctor } = useContext(AdminContext);

  // Local state mirrors AddDoctor.jsx (password optional on edit)
  const [docImg, setDocImg] = useState(false);
  const [previewUrl, setPreviewUrl] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [experience, setExperience] = useState("1 Year");
  const [fees, setFees] = useState("");
  const [about, setAbout] = useState("");
  const [speciality, setSpeciality] = useState("General physician");
  const [degree, setDegree] = useState("");
  const [address1, setAddress1] = useState("");
  const [address2, setAddress2] = useState("");
  const [password, setPassword] = useState(""); // <-- NEW: optional password

  // Find the doctor from context when available
  const doc = useMemo(
    () => doctors.find((d) => d?._id === doctorId),
    [doctors, doctorId]
  );

  // Ensure we have doctors list (for deep links)
  useEffect(() => {
    if (!doctors || doctors.length === 0) {
      getAllDoctors();
    }
  }, [doctors, getAllDoctors]);

  // Prefill the form when doc becomes available
  useEffect(() => {
    if (doc) {
      setName(doc.name ?? "");
      setEmail(doc.email ?? "");
      setExperience(doc.experience ?? "1 Year");
      setFees(doc.fees?.toString() ?? "");
      setAbout(doc.about ?? "");
      setSpeciality(doc.speciality ?? "General physician");
      setDegree(doc.degree ?? "");
      setAddress1(doc.address?.line1 ?? "");
      setAddress2(doc.address?.line2 ?? "");
      setPreviewUrl(doc.image ?? "");
      setDocImg(false);
      setPassword(""); // never pre-fill password
    }
  }, [doc]);

  // Cleanup object URLs
  useEffect(() => {
    return () => {
      if (previewUrl && previewUrl.startsWith("blob:")) {
        try {
          URL.revokeObjectURL(previewUrl);
        } catch (_) {}
      }
    };
  }, [previewUrl]);

  const onImageChange = (file) => {
    if (!file) return;
    setDocImg(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
  };

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    if (!doc) return; // no-op if not loaded yet

    const formData = new FormData();
    // Append only fields we allow to edit (mirrors AddDoctor keys, minus required password)
    if (docImg) formData.append("image", docImg);
    formData.append("name", name);
    formData.append("email", email);
    formData.append("experience", experience);
    formData.append("fees", Number(fees));
    formData.append("about", about);
    formData.append("speciality", speciality);
    formData.append("degree", degree);
    formData.append(
      "address",
      JSON.stringify({ line1: address1, line2: address2 })
    );

    // Pass optional password via the context helper (it appends only if non-empty)
    const ok = await editDoctor(doctorId, formData, { password });

    if (ok) {
      // Redirect to doctors list after successful update
      navigate("/doctor-list");
    }
  };

  if (!doc) {
    return (
      <div className="w-full flex items-center justify-center py-20 text-gray-600">
        Loading doctor details...
      </div>
    );
  }

  return (
    <div className="w-full max-w-3xl">
      <h2 className="text-xl font-semibold mb-6">Edit Doctor</h2>

      <form
        onSubmit={onSubmitHandler}
        className="flex flex-col gap-5 bg-white p-5 rounded border"
      >
        {/* Image upload (same pattern as AddDoctor.jsx) */}
        <div>
          <label
            htmlFor="doc-img"
            className="flex items-center gap-4 cursor-pointer"
          >
            <img
              src={previewUrl || assets.upload_area}
              alt="doctor"
              className="w-24 h-24 object-cover rounded border"
            />
            <div className="text-gray-700">
              <p className="font-medium">Upload doctor picture</p>
              <p className="text-sm text-gray-500">
                Click the image to select a new one (optional)
              </p>
            </div>
          </label>
          <input
            onChange={(e) => onImageChange(e.target.files?.[0])}
            type="file"
            id="doc-img"
            accept="image/*"
            hidden
          />
        </div>

        {/* Name */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">Doctor Name</label>
          <input
            onChange={(e) => setName(e.target.value)}
            value={name}
            className="border rounded px-3 py-2"
            type="text"
            placeholder="Name"
            required
          />
        </div>

        {/* Email */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">Doctor Email</label>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border rounded px-3 py-2"
            type="email"
            placeholder="example@email.com"
            required
          />
        </div>

        {/* Experience */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">Experience</label>
          <select
            onChange={(e) => setExperience(e.target.value)}
            value={experience}
            className="border rounded px-3 py-2"
          >
            <option>1 Year</option>
            <option>2 Years</option>
            <option>3 Years</option>
            <option>4 Years</option>
            <option>5 Years</option>
            <option>6 Years</option>
            <option>7 Years</option>
            <option>8 Years</option>
            <option>9 Years</option>
            <option>10 Years</option>
          </select>
        </div>

        {/* Fees */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">Fees</label>
          <input
            onChange={(e) => setFees(e.target.value)}
            value={fees}
            className="border rounded px-3 py-2"
            type="number"
            placeholder="fees"
            required
          />
        </div>

        {/* Speciality */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">Speciality</label>
          <select
            onChange={(e) => setSpeciality(e.target.value)}
            value={speciality}
            className="border rounded px-3 py-2"
          >
            <option>General physician</option>
            <option>Gynecologist</option>
            <option>Dermatologist</option>
            <option>Pediatricians</option>
            <option>Neurologist</option>
            <option>Gastroenterologist</option>
          </select>
        </div>

        {/* Degree */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">Education</label>
          <input
            onChange={(e) => setDegree(e.target.value)}
            value={degree}
            className="border rounded px-3 py-2"
            type="text"
            placeholder="Education"
            required
          />
        </div>

        {/* Address */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">Address</label>
          <input
            onChange={(e) => setAddress1(e.target.value)}
            value={address1}
            className="border rounded px-3 py-2"
            type="text"
            placeholder="address 1"
            required
          />
          <input
            onChange={(e) => setAddress2(e.target.value)}
            value={address2}
            className="border rounded px-3 py-2"
            type="text"
            placeholder="address 2"
            required
          />
        </div>

        {/* About */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">About Doctor</label>
          <textarea
            onChange={(e) => setAbout(e.target.value)}
            value={about}
            className="w-full px-4 pt-2 border rounded"
            placeholder="doctor's background"
            rows={5}
            required
          />
        </div>

        {/* NEW: Password (optional) */}
        <div className="flex flex-col gap-2">
          <label className="text-gray-700">New Password (optional)</label>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border rounded px-3 py-2"
            type="password"
            placeholder="Enter new password (min 8 chars)"
          />
          <p className="text-xs text-gray-500">
            Leave blank to keep the current password.
          </p>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="submit"
            className="bg-primary text-white px-5 py-2 rounded hover:opacity-90"
          >
            Save Changes
          </button>

          <button
            type="button"
            onClick={() => {
              // Reset to current doc values
              if (doc) {
                setName(doc.name ?? "");
                setEmail(doc.email ?? "");
                setExperience(doc.experience ?? "1 Year");
                setFees(doc.fees?.toString() ?? "");
                setAbout(doc.about ?? "");
                setSpeciality(doc.speciality ?? "General physician");
                setDegree(doc.degree ?? "");
                setAddress1(doc.address?.line1 ?? "");
                setAddress2(doc.address?.line2 ?? "");
                setDocImg(false);
                setPreviewUrl(doc.image ?? assets.upload_area);
                setPassword("");
              }
            }}
            className="border px-5 py-2 rounded hover:bg-gray-50"
          >
            Reset
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditDoctor;
