import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import axios from "axios";
import type { User } from "../../utils/type";

// lấy tất cả user
export const getAllUser = createAsyncThunk("getAllUser", async () => {
  try {
    const res = await axios.get("http://localhost:8080/user");
    return res.data;
  } catch (error) {
    console.log(error);
  }
});

// thêm user
export const addUser = createAsyncThunk("addUser", async (newUser: User) => {
  try {
    const response = await axios.post("http://localhost:8080/user", newUser);
    return response.data;
  } catch (error) {
    console.log(error);
  }
});

export const userSlice = createSlice({
  name: "user",
  initialState: {
    users: [],
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getAllUser.fulfilled, (state: any, action) => {
        state.users = action.payload;
      })
      .addCase(addUser.fulfilled, (state: any, action) => {
        state.users.push(action.payload);
      });
  },
});

export default userSlice.reducer;
