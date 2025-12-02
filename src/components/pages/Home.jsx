import { Suspense } from "react";
import FileUploadManager from "@/components/organisms/FileUploadManager";
import Loading from "@/components/ui/Loading";

const Home = () => {
  return (
    <Suspense fallback={<Loading />}>
      <FileUploadManager />
    </Suspense>
  );
};

export default Home;