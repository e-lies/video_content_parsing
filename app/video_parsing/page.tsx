import VideoParsingSettings from '@/components/VideoParsingSetting';
import parsingSettings from '@/utils/parsing_settings.json'

/*const fetchIndexes = async () => {
    const response = await fetch('http://localhost:3000/api/getIndexes');
    if (!response.ok) {
        throw new Error('Failed to fetch indexes');
    }
    return response.json();
}*/

const Page = () => {
    return (
    <div id="parsing">
        <VideoParsingSettings indexes={parsingSettings as any[]} />;
    </div>
    );
};


export default Page;