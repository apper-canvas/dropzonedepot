import React, { Suspense } from "react";
import Loading from "@/components/ui/Loading";
import FileUploadManager from "@/components/organisms/FileUploadManager";

const Home = () => {
  return (
    <Suspense fallback={<Loading />}>
      <FileUploadManager />
    </Suspense>
  );
};

export default Home;