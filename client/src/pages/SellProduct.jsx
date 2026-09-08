import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

function SellProduct() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/my-listings');
  }, [navigate]);

  return <div />;
}

export default SellProduct;
