import { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'
import { useLocation, Link, useParams } from 'react-router-dom'
import axios from 'axios'
import NewBank from './components/NewBank'
import Popups from '../../components/Popups'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Box, Button, Tooltip } from '@mui/material'
import { Bounce, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import BankForm from './components/BankForm'

export default function Banks() {

  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const loc = useLocation(); //to get the current location ex. http://localhost:5173/category
  const [bankId, setBankId] = useState()
  const [openPopup, setOpenPopup] = useState(false); //This state variable is used to control the visibility of a popup in the component.
  const [bank, setBank] = useState([])
  // Start of loadBankData - use to load the x-datagrid to view the changes
  const loadBankData = async () => {
    try {
      const response = await axios.get(`/api${loc.pathname}`);
      setBank(response.data);
    } catch (error) {
      console.error('Error loading bank data:', error);
    }
  };
  // End of loadBankData - use to load the x-datagrid to view the changes
  const handleOnEditClick = ({id}) => {
    setBankId(id)
    setOpenPopup(true)
  }
  // Start columns - this is for the x-datagrid
  const columns = [
    { field: 'name', flex : 1, headerName : 'Bank Name'},
    { field: 'check_location', flex : 1, headerName : 'Bank Location'},
    { field: 'bank_branch', flex : 1, headerName : 'Bank/Branch'},
    {
      field: 'actions',
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <div className='flex items-center justify-between'>
          <Tooltip title="Edit" placement="top" arrow>
              <Button
                component={Link}
                // to={`/banks/${params.row.id}`}
                sx={{color: colors.greenAccent[400], cursor: 'auto'}}
                onClick={(e) => handleOnEditClick(params)} 
              >
                <EditCalendarOutlined sx={{cursor: 'pointer'}} />
              </Button>
          </Tooltip>
          <Tooltip title="Delete" placement="top" arrow>
              <Button
                sx={{color: colors.redAccent[500], cursor: 'auto'}}
                onClick={() => handleDelete(params.row.id)} 
              >
                <DeleteOutlined sx={{cursor: 'pointer'}} />
              </Button>
          </Tooltip>
          
        </div>
      ),
    },
  ];
  // End columns - this is for the x-datagrid

  // Start Refresh - refresh the category data after a new category added
  const handleBankAdded = () => {
    loadBankData();
  };
  // End Refresh

  // Start Delete function
  const handleDelete = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this bank?");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`/api/banks/delete/${id}`);
      console.log(response.data);
      loadBankData();
      toast.success('Bank Successfully Deleted!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    } catch (error) {
      console.error('Error deleting bank:', error);
      toast.error('Error deleting bank, Please try again!', {
        position: "top-right",
        autoClose: 5000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        theme: "colored",
        transition: Bounce,
      });
    }
  };
  // End Delete function

  // Start closing the popup
  const handleClosePopup = () => {
    setOpenPopup(false);
  };
  // End closing the popup

  useEffect(()=>{
    loadBankData();
  }, [loc]);

  return (
    <Box height='100%' display='flex' flexDirection='column' padding={2}>
      <Header 
        title={'Bank'} 
        showButton= {true}
        onAddButtonClick={()=> {
          setBankId(null)
          setOpenPopup(true)
        }} 
      />
      <Box flex={1} position='relative'>
        <Box sx={{position: 'absolute', inset : 0}} >
          <DataGrid 
            columns={columns}
            rows={bank}
          />
        </Box>
      </Box>
      <Popups
            title="Bank"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
            // toURL={`/banks${loc.search}`}
        >
            <BankForm
              bankId={bankId}
              onBankAdded={handleBankAdded} 
              onClosePopup={handleClosePopup}
            />
      </Popups>
      
    </Box>
  )
}
