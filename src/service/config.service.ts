import { TDataLocal } from "@/types/auth/dataLocal.type";
import { toast } from "react-toastify";

export const configApi = (contentTypeJson: boolean = true) => {
  const localToken = localStorage.getItem("token");
  const token = localToken ? localToken : "";
  
  return {
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': contentTypeJson ? 'application/json':'multipart/form-data'
    }
  }
}

export const resolveResponse = (response: any) => {
  if(response["code"] == "ERR_NETWORK") {
    toast.error("Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.", {
      theme: 'colored'
    });
    return;
  }

  if(response.status >= 200 && response.status < 300) {
    toast.success(response.message, {
      theme: 'colored'
    });
    return;
  };

  const result = response.response.data.result;

  if(response.status >= 400 && response.status < 500) {
    if(response.status === 401) {
      toast.warn("Sessão finalizada!", {
        theme: 'colored'
      });

      setTimeout(() => {
        window.location.href = "/";
        removeLocalStorage();
      }, 1000);
      return;
    }

    toast.warn(result.message, {
      theme: 'colored'
    });
    return;
  };

  toast.error("Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.", {
    theme: 'colored'
  });
};

export const saveLocalStorage = (data: TDataLocal, hasToken: boolean = false) => {
  if(hasToken) {
    localStorage.setItem("token", data.token);
  };

  localStorage.setItem("name", data.name);
  localStorage.setItem("email", data.email);
  localStorage.setItem("admin", data.admin);
  localStorage.setItem("photo", data.photo);
  localStorage.setItem("logoCompany", data.logoCompany);
  localStorage.setItem("nameCompany", data.nameCompany);
  localStorage.setItem("nameStore", data.nameStore);
  localStorage.setItem("modules", JSON.stringify(data.modules));
};

export const removeLocalStorage = () => { 
  localStorage.removeItem("token");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("admin");
  localStorage.removeItem("photo");
  localStorage.removeItem("logoCompany");
  localStorage.removeItem("nameCompany");
  localStorage.removeItem("nameStore");
  localStorage.removeItem("modules");
};