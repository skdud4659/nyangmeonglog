import breeds from '@/features/onBoarding/data/pet_breeds.json';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDown, X } from 'lucide-react';
import { useState } from 'react';

interface BreedDropdownProps {
    value: string;
    onChange: (breed: string) => void;
    petType: 'dog' | 'cat';
}

const BreedDropdown = ({ value, onChange, petType }: BreedDropdownProps) => {
    const [isOpen, setIsOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');

    const breedList = petType === 'dog' ? breeds.dogBreeds : breeds.catBreeds;

    const filteredBreeds = breedList.filter(breed =>
        breed.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <>
            <div className="w-full border-b border-gray_3">
                <label className="block text-sm font-medium text-gray_7 mb-2">품종</label>
                <button
                    type="button"
                    onClick={() => setIsOpen(true)}
                    className="w-full flex justify-between items-center text-left"
                >
                    <span className="text-gray_9">{value || '품종을 선택해주세요'}</span>
                    <span className="text-gray-400">
                        <ChevronDown size={20} />
                    </span>
                </button>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            className="fixed inset-0 bg-black bg-opacity-50 z-40"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                        />

                        <motion.div
                            className="fixed left-0 right-0 bottom-0 bg-white rounded-t-2xl z-50 min-h-[90%] max-h-[90%] flex flex-col"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ duration: 0.3 }}
                        >
                            <div className="flex justify-between items-center p-4 border-b border-gray-200">
                                <h3 className="text-lg font-semibold">품종을 선택해주세요</h3>
                                <button onClick={() => setIsOpen(false)}>
                                    <X size={20} />
                                </button>
                            </div>

                            <div className="p-4">
                                <input
                                    type="text"
                                    value={searchTerm}
                                    onChange={e => setSearchTerm(e.target.value)}
                                    placeholder="검색"
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2"
                                />
                            </div>

                            <div className="flex-1 overflow-y-auto">
                                {filteredBreeds.map(breed => (
                                    <button
                                        key={breed}
                                        onClick={() => {
                                            onChange(breed);
                                            setIsOpen(false);
                                            setSearchTerm('');
                                        }}
                                        className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                                            value === breed
                                                ? 'bg-primary/10 text-primary font-medium'
                                                : ''
                                        }`}
                                    >
                                        {breed}
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default BreedDropdown;
