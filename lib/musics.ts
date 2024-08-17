export interface MusicStruct {
  artist: string;
  color: string;
  duration: number;
  id: string;
  title: string;
}

const MusicsData: MusicStruct[] = [];

async function getMusicsData() {
  try {
    const response = await fetch('/api/music');
    const result = await response.json();
    const transformedData: MusicStruct[] = result.data.map((item: any) => ({
      artist: item.attributes.artistName,
      color: '#' + item.attributes.artwork.bgColor,
      duration: Math.floor(item.attributes.durationInMillis / 1000), // Convert milliseconds to seconds
      id: item.id,
      title: item.attributes.name,
    }));
    MusicsData.push(...transformedData);
  } catch (error) {
    console.error('Error fetching music data:', error);
  }
  return MusicsData;
}


export default getMusicsData;