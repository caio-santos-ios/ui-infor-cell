"use client";

import { loadingAtom } from "@/jotai/global/loading.jotai";
import { api, uriBase } from "@/service/api.service";
import { configApi, resolveResponse } from "@/service/config.service";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import ComponentCard from "@/components/common/ComponentCard";
import { useRouter } from "next/navigation";
import DropzoneComponent from "@/components/form/form-elements/DropZone";
import Carousel from "@/components/ui/carousel/Carousel";
import Label from "@/components/form/Label";
import { FaTrash } from "react-icons/fa";

type TProp = {
  id?: string;
};

export default function ProductImageForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [images, setImage] = useState<{id: string; image: string; title: string; description: string}[]>([]);
  
  const getImages = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/attachments?deleted=false`, configApi());
      const result = data.result.data;
      const list = result.map((x: any) => ({id: x.id, image: `${uriBase}/${x.uri}`, title: "", description: ""}))
      setImage(list)
    } catch (error) {
      resolveResponse(error);
    } finally {
      setIsLoading(false);
    }
  };
  
  const uploadFile = async (file: File[]) => {
    const formBody = new FormData();
    
    const fileToUpload = file[0];
    formBody.append('file', fileToUpload);
    formBody.append('parent', 'product');
    formBody.append('parentId', id!);
    formBody.append('description', 'imagem do produto');
    formBody.append('type', 'main');
    await updatePhoto(formBody);
  };

  const updatePhoto = async (form: FormData) => {
    try {
      const { status } = await api.post(`/attachments`, form, configApi(false));
      resolveResponse({status, message: "Foto salva com sucesso"});
      await getImages();
    } catch (error) {
      resolveResponse(error);
    }
  };

  const deleteImage = async (imageId: string) => {
    try {
      await api.delete(`/attachments/${imageId}`, configApi(false));
      await getImages();
    } catch (error) {
      resolveResponse(error);
    }
  };
  
  useEffect(() => {
    if(id != "create") {
      getImages();
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-12 gap-2">  
          <div className="col-span-6 lg:col-span-4">
            <DropzoneComponent sendFile={uploadFile} title="" />
          </div>          
          <div className="col-span-6 lg:col-span-6">
            <Carousel slides={images} />
          </div>          
          <div className="col-span-6 lg:col-span-2">
            <ul className="flex flex-col gap-4 max-h-[calc(100dvh-21rem)] overflow-y-auto">
              {
                images.map((image: any) => {
                  return (
                    <li key={image.id} className="flex flex-wrap items-center font-medium gap-2 rounded-lg transition px-2 py-2 text-sm bg-white text-gray-700 ring-1 ring-inset ring-gray-300 dark:bg-gray-800 dark:text-gray-400 dark:ring-gray-700 w-full mb-3">
                      <div className="w-36 rounded-lg">
                        <img
                          src={image.image}
                          alt={'Foto do produto'}
                          className="object-cover rounded-lg"
                          />
                      </div>
                      <div onClick={() => deleteImage(image.id)} className="cursor-pointer text-red-400 hover:text-red-500">
                        <FaTrash />
                      </div>
                    </li>
                  )
                })
              }
            </ul>
          </div>          
        </div>
      </ComponentCard>
    </>
  );
}