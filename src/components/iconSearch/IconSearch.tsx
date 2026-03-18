import Button from "../ui/button/Button";
import { MdFilterAlt, MdFilterAltOff } from "react-icons/md";

type TProp = {
    getObj: () => any;
    active: boolean;
    variant: any;
}

export const IconSearch = ({ getObj, variant, active }: TProp) => {
    return (
        <Button title={active ? 'Filtro ativo' : 'Sem Filtro'} size="sm" variant={variant} onClick={() => getObj()}>
            {
                active ? <MdFilterAlt /> : <MdFilterAltOff /> 
            }
        </Button>
    );
};