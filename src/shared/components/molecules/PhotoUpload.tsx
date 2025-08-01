import { motion } from 'framer-motion';
import { Camera } from 'lucide-react';
import { useRef } from 'react';

interface PhotoUploadProps {
    photo?: string;
    onPhotoChange: (photo: string) => void;
}

const PhotoUpload = ({ photo, onPhotoChange }: PhotoUploadProps) => {
    const fileRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            onPhotoChange(reader.result as string);
        };
        reader.readAsDataURL(file);
    };

    return (
        <motion.div
            className={`w-20 h-20 rounded-full border-2 border-dashed flex items-center justify-center cursor-pointer ${
                photo ? 'border-primary' : 'border-gray-300'
            }`}
            onClick={() => fileRef.current?.click()}
            whileTap={{ scale: 0.95 }}
        >
            {photo ? (
                <img
                    src={photo}
                    alt="uploaded"
                    className="w-full h-full rounded-full object-cover"
                />
            ) : (
                <Camera className="text-gray-400 w-6 h-6" />
            )}
            <input
                type="file"
                accept="image/*"
                ref={fileRef}
                className="hidden"
                onChange={handleChange}
            />
        </motion.div>
    );
};

export default PhotoUpload;
