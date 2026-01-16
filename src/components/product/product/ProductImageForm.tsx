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

type TProp = {
  id?: string;
};

export default function ProductImageForm({id}: TProp) {
  const [_, setIsLoading] = useAtom(loadingAtom);
  const [images, setImage] = useState<{id: string; image: string; title: string; description: string}[]>([]);
  const router = useRouter();  

  // const { control, getValues, reset, register, setValue, watch } = useForm<TProduct>({defaultValues: ResetProduct});

  // const save = async (body: TProduct) => {
  //   if(!body.id) {
  //     await create(body);
  //   } else {
  //     await update(body);
  //   };
  // };
      
  // const create: SubmitHandler<TProduct> = async (body: TProduct) => {
  //   try {
  //     setIsLoading(true);
  //     const {data} = await api.post(`/products`, body, configApi());
  //     const result = data.result;
  //     resolveResponse({status: 201, message: result.message});
  //     router.push(`/product/products/${result.data.id}`)
  //   } catch (error) {
  //     resolveResponse(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };
    
  // const update: SubmitHandler<TProduct> = async (body: TProduct) => {
  //   try {
  //     setIsLoading(true);
  //     const {data} = await api.put(`/products`, body, configApi());
  //     const result = data.result;
  //     resolveResponse({status: 200, message: result.message});
  //   } catch (error) {
  //     resolveResponse(error);
  //   } finally {
  //     setIsLoading(false);
  //   }
  // };

  const getImages = async () => {
    try {
      setIsLoading(true);
      const {data} = await api.get(`/attachments?deleted=false`, configApi());
      const result = data.result.data;
      const list = result.map((x: any) => ({id: x.id, image: `${uriBase}/${x.uri}`, title: "", description: ""}))
      console.log(list)
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
  
  useEffect(() => {
    if(id != "create") {
      getImages();
    };
  }, []);

  return (
    <>
      <ComponentCard title="Dados Gerais" hasHeader={false}>
        <div className="grid grid-cols-6 gap-2 container-form">  
          <div className="col-span-6 lg:col-span-3">
            <DropzoneComponent sendFile={uploadFile} title="" />
          </div>          
          <div className="col-span-6 lg:col-span-3">
            <Carousel slides={images} />
          </div>          
        </div>
      </ComponentCard>
    </>
  );
}