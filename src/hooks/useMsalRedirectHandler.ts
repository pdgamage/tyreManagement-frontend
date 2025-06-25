import { useEffect } from "react";
import { useMsal } from "@azure/msal-react";
import { useAuth } from "../contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export function useMsalRedirectHandler() {
  const { instance } = useMsal();
  const { setUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    let handled = false;
    instance.handleRedirectPromise().then(async (loginResponse) => {
      if (handled) return;
      handled = true;
      if (loginResponse) {
        const idToken = loginResponse.idToken;
        const res = await fetch(
          `${import.meta.env.VITE_API_BASE_URL}/api/azure-protected`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${idToken}`,
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          localStorage.setItem("user", JSON.stringify(data.user));
          setUser(data.user);
          navigate(`/${data.user.role}`);
        } else {
          alert("Access denied: You are not authorized.");
        }
      }
    });
    // eslint-disable-next-line
  }, [instance, setUser, navigate]);
}
