import { useParams } from 'react-router-dom';

export default function ProjectPage() {
  const { id } = useParams();

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold">Project: {id}</h1>
      <p>Страница проекта (в разработке)</p>
    </div>
  );
}
