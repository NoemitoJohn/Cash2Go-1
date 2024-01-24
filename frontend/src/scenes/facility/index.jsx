import React, { useEffect, useState } from 'react'
import Header from '../../components/Header'
import { DataGrid } from '@mui/x-data-grid'
import axios from 'axios'
import Popups from '../../components/Popups'
import NewFacility from './components/NewFacility'
import { DeleteOutlined, EditCalendarOutlined } from '@mui/icons-material'
import { Button, Tooltip } from '@mui/material'
import { useTheme } from '@emotion/react'
import { tokens } from '../../theme'
import { Bounce, toast } from 'react-toastify';
import { Link, useLocation } from 'react-router-dom'
import 'react-toastify/dist/ReactToastify.css';

export default function Facility() {
  const [facility, setFacility] = useState([])
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const loc = useLocation();
  const [openPopup, setOpenPopup] = useState(false);

  const loadFacilityData = async () => {
    try {
      const response = await axios.get('http://localhost:8000/facility');
      setFacility(response.data);
    } catch (error) {
      console.error('Error loading deduction data:', error);
    }
  };

  const columns = [
    { field: 'name', flex : 1, headerName : 'Name'},
    { field: 'code', flex : 1, headerName : 'Code'},
    {
      field: 'actions',
      headerName: '',
      sortable: false,
      width: 150,
      renderCell: (params) => (
        <div className='flex items-center justify-between'>
          <Tooltip title="Edit" placement="top" arrow>
              <Button
                component={Link}
                to={`/facility/${params.row.id}`}
                sx={{color: colors.greenAccent[400], cursor: 'auto'}}
                onClick={() => setOpenPopup(true)} 
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

  const handleFacilityAdded = () => {
    // Refresh deduction data after a new deduction is added
    loadFacilityData();
  };

  const handleDelete = async (id) => {
    // Show confirmation dialog
    const isConfirmed = window.confirm("Are you sure you want to delete this facility?");
    if (!isConfirmed) {
      return;
    }

    try {
      const response = await axios.delete(`http://localhost:8000/facility/delete/${id}`);
      console.log(response.data);
      loadFacilityData();
      toast.success('Facility Successfully Deleted!', {
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
      console.error('Error deleting deduction:', error);
      toast.error('Error deleting facility, Please try again!', {
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


  const handleClosePopup = () => {
    setOpenPopup(false);
  };

  useEffect(() =>{ 
    loadFacilityData();
  }, [])
  return (
    <div style={ {height : '75%', padding : 20}}>
      <Header 
        title={'Facilities'} 
        subtitle={'List of facilities together with their respective codes!'}
        showButton={true}
        onAddButtonClick={()=> setOpenPopup(true)} 
        toURL={loc.pathname + '/new'}
      />
      <DataGrid 
        columns={columns}
        rows={facility}
      />

      <Popups
            title="Facility"
            openPopup={openPopup}
            setOpenPopup={setOpenPopup}
            toURL={'/facility'}
        >
            <NewFacility 
              onFacilityAdded={handleFacilityAdded} 
              onClosePopup={handleClosePopup}
            />
        </Popups>

    </div>
  )
}
