cmake_minimum_required(VERSION 2.8)
set_property(GLOBAL PROPERTY TARGET_SUPPORTS_SHARED_LIBS TRUE)

set(CMAKE_SHARED_LIBRARY_CREATE_C_FLAGS "")
set(CMAKE_SHARED_LIBRARY_CREATE_CXX_FLAGS "")

project(casl2interpriter)
add_executable(casl2interpriter src/entry_point.cpp src/interpreter.cpp src/register.cpp src/flag_register.cpp src/memory.cpp)
set_target_properties( casl2interpriter PROPERTIES LINK_FLAGS "-s EXPORTED_RUNTIME_METHODS=['ccall','UTF8ToString']")
target_link_options(
  casl2interpriter
  PRIVATE
    --bind
    -sEXPORTED_FUNCTIONS=_malloc,_free
    -sNO_DISABLE_EXCEPTION_CATCHING)
