import { modal403Atom } from "@/jotai/auth/auth.jotai";
import { TDataLocal } from "@/types/auth/dataLocal.type";
import { getDefaultStore } from "jotai";
import { toast } from "react-toastify";

const store = getDefaultStore();

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
  if(response.status == 400) {
    if(response.response.data["errors"]) {
      handleApiErrors(response);
      return;
    };
  };

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
    };

    if(response.status == 403) {
      store.set(modal403Atom, true);
      return;
    };

    toast.warn(result.message, {
      theme: 'colored'
    });
    return;
  };

  toast.error("Ocorreu um erro inesperado. Por favor, tente novamente mais tarde.", {
    theme: 'colored'
  });
};

const handleApiErrors = (error: any) => {
    if (error.response && error.response.status === 400) {
        const data = error.response.data;
        
        if (data.errors && Array.isArray(data.errors)) {
          return toast.warn(data.errors[0].message, {theme: 'colored'}); 
        }
        
        if (data.errors && typeof data.errors === 'object') {
          const firstKey = Object.keys(data.errors)[0];
          return toast.warn(data.errors[firstKey][0], {theme: 'colored'}); 
        }
    }

    return error.message || "Ocorreu um erro inesperado. Tente novamente.";
};

export const saveLocalStorage = (data: TDataLocal, hasToken: boolean = false) => {
  if(hasToken) {
    localStorage.setItem("token", data.token);
    localStorage.setItem("refreshToken", data.refreshToken);
  };

  if(data.master) {
    localStorage.setItem("master", data.master);
  };

  // localStorage.setItem("typeUser", data.typeUser);
  localStorage.setItem("expirationDate", data.expirationDate);
  localStorage.setItem("typePlan", data.typePlan);
  localStorage.setItem("subscriberPlan", data.subscriberPlan);
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
  // localStorage.removeItem("typeUser");
  localStorage.removeItem("master");
  localStorage.removeItem("expirationDate");
  localStorage.removeItem("typePlan");
  localStorage.removeItem("subscriberPlan");
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  localStorage.removeItem("name");
  localStorage.removeItem("email");
  localStorage.removeItem("admin");
  localStorage.removeItem("photo");
  localStorage.removeItem("logoCompany");
  localStorage.removeItem("nameCompany");
  localStorage.removeItem("nameStore");
  localStorage.removeItem("modules");
};