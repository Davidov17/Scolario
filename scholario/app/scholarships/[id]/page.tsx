import Navbar from "../../../components/Navbar";

const scholarships = {
  "1": {
    title: "DAAD Scholarship",
    country: "Germany",
  },
  "2": {
    title: "Erasmus+ Scholarship",
    country: "Europe",
  },
  "3": {
    title: "Korean Government Scholarship",
    country: "South Korea",
  },
};

export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const data = scholarships[id as keyof typeof scholarships];

  if (!data) {
    return <h1>Not found</h1>;
  }

  return (
    <>
      <Navbar />
      <main className="p-10">
        <h1 className="text-3xl font-bold">{data.title}</h1>
        <p className="text-lg mt-2">Country: {data.country}</p>
      </main>
    </>
  );
}