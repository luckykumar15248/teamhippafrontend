'use client';
import PostEditor from '@/app/components/PostEditor/PostEditor';
import React from 'react';


const NewPostPage: React.FC = () => {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Create New Post</h1>
      <PostEditor />
    </div>
  );
};

export default NewPostPage;
