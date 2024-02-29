import React, { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';


const Help = () => {
    const [markdown, setMarkdown] = useState('');

    useEffect(() => {
      fetch( process.env.PUBLIC_URL +'/HELP.md')
        .then((response) => response.text())
        .then((text) => setMarkdown(text));
    }, []);
  

    return (
        <>
            <div>
                <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
        </>
    );
};

export default Help;
