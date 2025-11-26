import React from 'react';
import styled from 'styled-components';

// 스타일 컴포넌트
const SearchContainer = styled.div`
  width: 100%;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 15px 20px;
  font-size: 16px;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-sizing: border-box;
`;

const TopBar = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 15px;
  background: #fff;
  border-radius: 8px;
  border: 1px solid #eee;
  position: sticky;
  top: 0;
  z-index: 10;
  flex-wrap: wrap;
  gap: 10px;
`;

const LeftGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
`;

const FilterButton = styled.button`
display: none;
  padding: 8px 12px;
  font-size: 14px;
  font-weight: 600;
  border: 1px solid #ddd;
  background: white;
  border-radius: 4px;
  cursor: pointer;
  @media (max-width: 768px) {
    display: block;
  }
`;

const TopBarControls = styled.div`
  display: flex;
  align-items: center;
`;

const ProductCount = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #666;
  & strong {
    color: #333;
    font-weight: 700;
  }
`;

const RightGroup = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SortSelect = styled.select`
  padding: 8px 12px;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  background: white;
  cursor: pointer;
  outline: none;
`;

// 내 피부 프로필 토글 버튼 스타일
const ProfileToggleBtn = styled.button`
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 600;
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  align-items: center;
  gap: 6px;

  /* 활성화 상태(isactive)에 따른 스타일 분기 */
  background-color: ${props => props.$active ? '#333' : '#f5f5f5'};
  color: ${props => props.$active ? '#fff' : '#888'};
  border: 1px solid ${props => props.$active ? '#333' : '#ddd'};

  &:hover {
    background-color: ${props => props.$active ? '#444' : '#e9e9e9'};
  }
`;

const ProductListHeader = ({
  searchTerm,
  totalElements,
  sortOrder,
  onSortChange,
  onFilterToggle
}) => {
  return (
    <TopBar>
      <LeftGroup>
        <FilterButton onClick={onFilterToggle}>
          필터
        </FilterButton>
        <ProductCount>
          총 <strong>{totalElements}</strong>개
        </ProductCount>
      </LeftGroup>
      
      <RightGroup>
        <SortSelect 
          value={sortOrder} 
          onChange={onSortChange}
        >
          <option value="popularity">인기순</option>
          <option value="newest">최신순</option>
          <option value="priceAsc">가격 낮은 순</option>
          <option value="priceDesc">가격 높은 순</option>
        </SortSelect>
      </RightGroup>
    </TopBar>
  );
};

export default ProductListHeader;
