import UserRequestUpdate from "../pages/UserRequestUpdate";

// Add to routes array:
{
  path: "/user/request-update/:id",
  element: (
    <ProtectedRoute>
      <UserRequestUpdate />
    </ProtectedRoute>
  )
}