#define NODE_ADDON_API_DISABLE_DEPRECATED 1
#include <napi.h>

#define STRINGIFY_HELPER(x) #x
#define STRINGIFY(x) STRINGIFY_HELPER(x)

using namespace Napi;

// ==== jemalloc stuff ====
extern "C" int __attribute__((weak)) mallctl(const char *name, void *oldp, size_t *oldlenp, void *newp, size_t newlen);

#define THROW_ON_ERROR(err)                                                 \
    if (err) {                                                              \
        Error::New(env, strerrorname_np(err)).ThrowAsJavaScriptException(); \
        return env.Undefined();                                             \
    }

template <typename T>
Value jeDoRead(const char* name, Napi::Env& env)
{
    T result;
    size_t len = sizeof(result);
    auto err = mallctl(name, &result, &len, nullptr, 0);
    THROW_ON_ERROR(err);
    return Value::From(env, result);
}
template<>
Value jeDoRead<void>(const char* name, Napi::Env& env)
{
    auto err = mallctl(name, nullptr, 0, nullptr, 0);
    THROW_ON_ERROR(err);
    return env.Undefined();
}

template <typename T>
Value jeRead(const CallbackInfo& info)
 {
    Napi::Env env = info.Env();
    if (info.Length() != 1) {
        Error::New(env, "Wrong number of arguments, must be 1").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    Value arg = info[0];
    if (!arg.IsString()) {
        Error::New(env, "Argument is not a string").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    return jeDoRead<T>(arg.ToString().Utf8Value().c_str(), env);
}

// Original template for numeric types
template<typename T, typename JT = void>
Value jeDoWrite(const char* name, Value jsVal, Napi::Env& env)
{
    T val = static_cast<JT>(jsVal.As<Number>());
    auto err = mallctl(name, nullptr, 0, &val, sizeof(val));
    THROW_ON_ERROR(err);
    return env.Undefined();
}

// Overloaded template for std::string
template<>
Value jeDoWrite<std::string, void>(const char* name, Value jsVal, Napi::Env& env)
{
    std::string val = jsVal.ToString().Utf8Value();
    const char* valPtr = val.c_str();
    auto err = mallctl(name, nullptr, 0, &valPtr, sizeof(valPtr));
    THROW_ON_ERROR(err);
    return env.Undefined();
}

template<>
Value jeDoWrite<bool, void>(const char* name, Value jsVal, Napi::Env& env)
{
    bool val = jsVal.ToBoolean();
    auto err = mallctl(name, nullptr, 0, &val, sizeof(val));
    THROW_ON_ERROR(err);
    return env.Undefined();
}

template <typename T, typename JT = void>
Value jeWrite(const CallbackInfo& info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 2) {
        Error::New(env, "Wrong number of arguments, must be 2").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    Value name = info[0];
    if (!name.IsString()) {
        Error::New(env, "Argument 1 is not a string").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    return jeDoWrite<T, JT>(name.ToString().Utf8Value().c_str(), info[1], env);
}

template<>
Value jeWrite<bool>(const CallbackInfo& info) {
    Napi::Env env = info.Env();
    if (info.Length() != 2) {
        Error::New(env, "Wrong number of arguments, must be 2").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    Value name = info[0];
    if (!name.IsString()) {
        Error::New(env, "Argument 1 is not a string").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    Value value = info[1];
    if (!value.IsBoolean()) {
        Error::New(env, "Argument 1 is not a boolean").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    return jeDoWrite<bool>(name.ToString().Utf8Value().c_str(), info[1], env);
}

template<>
Value jeWrite<std::string>(const CallbackInfo& info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 2) {
        Error::New(env, "Wrong number of arguments, must be 2").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    Value name = info[0];
    if (!name.IsString()) {
        Error::New(env, "Argument 1 is not a string").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    Value value = info[1];
    if (!value.IsString()) {
        Error::New(env, "Argument 1 is not a string").ThrowAsJavaScriptException();
        return env.Undefined();
    }
    std::string command = name.ToString().Utf8Value();
    return jeDoWrite<std::string>(command.c_str(), info[1], env);
}

template<>
Value jeWrite<void>(const CallbackInfo& info)
{
    Napi::Env env = info.Env();
    if (info.Length() != 1) {
        Error::New(env, "Wrong number of arguments, must be 1").ThrowAsJavaScriptException();
        return env.Undefined();
    }

    std::string command = info[0].ToString().Utf8Value();
    auto err = mallctl(command.c_str(), NULL, NULL, NULL, 0);
    THROW_ON_ERROR(err);
    return env.Undefined();
}

Object jeCreateNamespace(Env env) {
    auto ns = Object::New(env);
    ns.Set("readSize", Function::New(env, jeRead<size_t>));
    ns.Set("readSSize", Function::New(env, jeRead<ssize_t>));
    ns.Set("readU32", Function::New(env, jeRead<uint32_t>));
    ns.Set("readU64", Function::New(env, jeRead<uint64_t>));
    ns.Set("writeU64", Function::New(env, jeWrite<uint64_t, int64_t>));
    ns.Set("readString", Function::New(env, jeRead<const char*>));
    ns.Set("writeString", Function::New(env, jeWrite<std::string>));
    ns.Set("readBool", Function::New(env, jeRead<bool>));
    ns.Set("writeBool", Function::New(env, jeWrite<bool>));
    ns.Set("readUnsigned", Function::New(env, jeRead<unsigned>));
    ns.Set("writeSize", Function::New(env, jeWrite<size_t, int64_t>));
    ns.Set("writeSSize", Function::New(env, jeWrite<ssize_t, int64_t>));
    ns.Set("writeUnsigned", Function::New(env, jeWrite<unsigned, int64_t>));
    ns.Set("ctlCommand", Function::New(env, jeWrite<void>));
    return ns;
}
Object Init(Env env, Object exports)
{
    if (mallctl) {
        exports.Set("ctl", jeCreateNamespace(env));
    }
    return exports;
}

NODE_API_MODULE(malloc_tools_native, Init);
