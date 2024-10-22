import React, { useState } from 'react';

const ParsingForm: React.FC = (indexes) => {
    const [formData, setFormData] = useState({
        name: '',
        context: '',
        instructions: '',
        subForms: [
            {
                type: 'text',
                required: false,
                multiple: false,
                description: ''
            }
        ]
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>, index: number) => {
        const { name, value } = e.target;
        const updatedSubForms = formData.subForms.map((subForm, i) => 
            i === index ? { ...subForm, [name]: value } : subForm
        );
        setFormData({
            ...formData,
            subForms: updatedSubForms
        });
    };

    const handleMainChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData({
            ...formData,
            [name]: value
        });
    };

    const handleAddSubForm = () => {
        setFormData({
            ...formData,
            subForms: [
                ...formData.subForms,
                { type: 'text', required: false, multiple: false, description: '' }
            ]
        });
    };

    const handleDeleteSubForm = (index: number) => {
        setFormData({
            ...formData,
            subForms: formData.subForms.filter((_, i) => i !== index)
        });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        // Send formData to the server
        console.log(formData);
    };

    return (
        <form onSubmit={handleSubmit}>
            <h2>{JSON.stringify(indexes)} </h2>
            <div>
                <label>
                    Name:
                    <input type="text" name="name" value={formData.name} onChange={handleMainChange} />
                </label>
            </div>
            <div>
                <label>
                    Context:
                    <textarea name="context" value={formData.context} onChange={handleMainChange} />
                </label>
            </div>
            <div>
                <label>
                    Instructions:
                    <textarea name="instructions" value={formData.instructions} onChange={handleMainChange} />
                </label>
            </div>
            {formData.subForms.map((subForm, index) => (
                <div key={index}>
                    <div>
                        <label>
                            Type:
                            <select name="type" value={subForm.type} onChange={(e) => handleChange(e, index)}>
                                <option value="text">Text</option>
                                <option value="number">Number</option>
                                <option value="boolean">Boolean</option>
                            </select>
                        </label>
                    </div>
                    <div>
                        <label>
                            Required:
                            <input type="checkbox" name="required" checked={subForm.required} onChange={(e) => handleChange(e, index)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Multiple:
                            <input type="checkbox" name="multiple" checked={subForm.multiple} onChange={(e) => handleChange(e, index)} />
                        </label>
                    </div>
                    <div>
                        <label>
                            Description:
                            <input type="text" name="description" value={subForm.description} onChange={(e) => handleChange(e, index)} />
                        </label>
                    </div>
                    <button type="button" onClick={() => handleDeleteSubForm(index)}>Delete</button>
                </div>
            ))}
            <button type="button" onClick={handleAddSubForm}>Add Key</button>
            <button type="submit">Confirm</button>
        </form>
    );
};

export default ParsingForm;