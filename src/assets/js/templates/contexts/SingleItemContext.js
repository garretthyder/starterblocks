const { createContext } = wp.element;
const SingleItemContext = createContext({});
export const SingleItemProvider = SingleItemContext.Provider;
export const SingleItemConsumer = SingleItemContext.Consumer;
export default SingleItemContext;