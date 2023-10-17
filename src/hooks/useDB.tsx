import { useContext } from 'react'
import { DBContext } from '@/context/DBContext';
const useDB = () => {
    return useContext(DBContext);
}

export default useDB
