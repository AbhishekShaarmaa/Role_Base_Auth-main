import { useDispatch, useSelector } from "react-redux";
import { Outlet, useNavigate } from "react-router-dom";
import { get } from "../services/ApiEndpoint";
import { SetUser } from "../redux/AuthSlice";
import { useEffect } from "react";

export default function AuthLayout() {

  const userData = useSelector(state => state.AuthSlice.user)
  const dispatch = useDispatch();
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      if (!userData) {
        const request = await get('/api/auth/CheckUser');
        if (request.data) {
          dispatch(SetUser(request.data));
        }
      }
    })();
  }, [])


  if (userData && userData?.role != 'user') {
    navigate('/')
  }
  else {
    return <Outlet />
  }
}
