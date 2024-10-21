//import { GetStaticProps } from 'next';
import VideoParsingSettings from '@/components/VideoParsingSetting';
import parsingSettings from '@/utils/parsing_settings.json'

const VIDEO_PARSER_ID = 'your-parser-id'; // Replace with your actual parser ID

const fetchIndexes = async () => {
    const response = await fetch('http://localhost:3000/api/getIndexes');
    if (!response.ok) {
        throw new Error('Failed to fetch indexes');
    }
    return response.json();
}

const VideoParsingSetting = ({ videos }: { videos: any[] }) => {
    return (
        <div>
            <h1>Video Parsing Settings</h1>
            <ul>
                {videos.map((video, index) => (
                    <li key={index}>{video.title}</li>
                ))}
            </ul>
        </div>
    );
};

const Page = () => {
    return (
    <div id="parsing">
        <VideoParsingSettings indexes={parsingSettings as any[]} />;
    </div>
    );
};


export default Page;