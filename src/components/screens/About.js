import React from 'react';
import ReactMarkdown from 'react-markdown';

const markdown = `
# This is a header

And this is a paragraph with *emphasis*.

- List item 1
- List item 2
`;

const About = () => {

    return (
        <>
            <div>About Page</div>
            <div>
                <ReactMarkdown>{markdown}</ReactMarkdown>
            </div>
        </>
    );
};

export default About;
