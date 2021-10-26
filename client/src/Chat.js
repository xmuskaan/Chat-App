import {ApolloClient,InMemoryCache,ApolloProvider,useSubscription,gql,useMutation} from "@apollo/client";
import { useState } from "react";
import {WebSocketLink} from '@apollo/client/link/ws';

//npm install subscriptions-transport-ws
const link = new WebSocketLink({
    uri: 'ws://localhost:4000/',
    options:{
        reconnect:true
    },
});

//npm install @apollo/client
const client = new ApolloClient({
    link,
    uri: "http://localhost:4000/",
    cache: new InMemoryCache(),
});

const GET_MESSAGES = gql `
    subscription {
        messages{
            id
            content
            user
        }
    }
`;

const POST_MESSAGE = gql `
    mutation ($user:String!, $content: String!){
        postMessage(user: $user, content:$content)
    }`

const Messages = ({ user }) => {
    const { data } = useSubscription(GET_MESSAGES);
    console.log(data);
    if(!data){
        return null;
    }


    return(
        <>
        {data.messages.map( ({id,user:messageUser,content} ) =>
            <div style={{
                display:'flex',
                justifyContent: user === messageUser ? 'flex-end':"flex-start",
                paddingBottom:"1em",
            }}>
                {user !== messageUser &&
                    <div style={{
                        height:"50",
                        width:"50",
                        marginRight:"0.5em",
                        border:"2px solid #333",
                        textAlign:"center",
                        fontSize:"18px",
                    }}
                    > {messageUser.slice(0,2).toUpperCase()}</div>
                } 
                <div style={{
                    background: user===messageUser? "#58bf56" : "#e5e6ea",
                    maxWidth:"60%",
                    }}>
                {content}</div>
            </div>
        )}
        </>
    )
}

const Chat = () => {

    const [state, setstate] = useState({
        user: 'Jack',
        content: '',
    });

    const [postMessage] = useMutation(POST_MESSAGE);

    const onSend = (e) => {
      
        if(state.content.length > 0){
            postMessage({
                variables:state,
            });   
        }
        setstate({
            ...state,
            content: '',
        });
        e.preventDefault();
    };

    

    return (  
        <div>Chat meow
           
             <Messages user={state.user}/>
             <form>
                 <label htmlFor="user"></label>
                 <input 
                    type="text"
                    value={state.user}
                    onChange= {(e) => setstate({
                        ...state,
                        user: e.target.value,
                    })
                    }
                    />

                <label htmlFor="user"></label>
                <input 
                    type="text"
                    value={state.content}
                    onChange= {(e) => setstate({
                        ...state,
                        content: e.target.value,
                    }
                    )}
                    // onKeyUp = {e => {
                    //     if(e.keyCode === 13){
                    //         onSend();
                    //     }
                    // }}
                />

                <button onClick={onSend}>Send</button>
             </form>
        </div>
    );
}




export default () => (
    <ApolloProvider client={client}>
       <Chat />
    </ApolloProvider>
);