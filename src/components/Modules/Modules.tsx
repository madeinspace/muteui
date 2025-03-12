import Module from "./module";

export const Modules = () => {
  const modulesArray = Array.from({ length: 8 }, (_, index) => {
    const name = index === 0 ? "Main" : `Expander ${index}`;

    return <Module key={index} name={name} />;
  });

  return (
    <div className="bg-gray-700 text-white p-6 shadow-md">
      <h2 className="text-2xl mb-6">Modules</h2>
      <div className="grid grid-cols-2 gap-6">{modulesArray}</div>
    </div>
  );
};
