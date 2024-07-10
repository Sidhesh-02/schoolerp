import "../styles/uploadExel.css";
import StudentsInfoDownload from '../components/StudentsInfoDownload';
import SearchStudent from '../components/SearchStudent';


const Search: React.FC = () => {

  return (
    <div className='ExcelUpload'>

      <div>
        <StudentsInfoDownload/>
        <SearchStudent/>
      </div>
      
    </div>
  );
};

export default Search;

