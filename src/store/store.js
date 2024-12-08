import { createStore } from "vuex";

export const store = createStore(  {
    state: () => ({
        authToken: null,
        user: null
    }),
    mutations: {
        clearUser(state) {
            state.authToken = null;
            state.user = null;
        },
        setUser(state, authData) {
            state.authToken = authData.token;
            state.user = authData.user;
        }
    },
    actions: {
        clearUser({commit}) {
            commit('clearUser');
        },
        setUser({ commit }, { token,  user }) {
            commit('setUser', { token, user });
        }
    }
})