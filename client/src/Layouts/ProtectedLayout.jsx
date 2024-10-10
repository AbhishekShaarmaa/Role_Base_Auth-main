import { useEffect } from "react"
import { Outlet, useLocation, useNavigate } from "react-router-dom"
import { get } from "../services/ApiEndpoint"
import { useDispatch, useSelector } from "react-redux"
import { SetUser } from "../redux/AuthSlice"

export default function ProtectedLayout() {

    const dispatch = useDispatch();
    const navigate = useNavigate();
    const userDetails = useSelector(state => state.AuthSlice?.user)
    const location = useLocation();

    useEffect(() => {
        (async () => {
            try {
                const request = await get('/api/auth/CheckUser');
                if (request.data) {
                    dispatch(SetUser(request.data));
                } else {
                    navigate('/login')
                }
            } catch (error) {
                navigate('/login')
            }
        })()
    }, []);

    if (userDetails?.role == 'user' && location.pathname != '/') {
        return navigate('/')
    }

    return (
        <>
            <Outlet />
        </>

    )
}
